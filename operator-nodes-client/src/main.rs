mod handlers;
use handlers::router::new_router;
use tokio::net::TcpListener;
use tokio::task;
use solana_client::rpc_client::RpcClient;
use solana_client::rpc_config::RpcTransactionConfig;
use solana_sdk::commitment_config::CommitmentConfig;
use solana_sdk::pubkey::Pubkey;
use solana_transaction_status_client_types::option_serializer::OptionSerializer;

 fn format_log_line(line: &str) -> String {
    // Omit binary program data (usually base64-encoded Anchor event payloads)
    if let Some(rest) = line.strip_prefix("Program data: ") {
        return format!("[program data omitted: {} bytes base64]", rest.len());
    }
    // Strip common noise prefixes
    if let Some(rest) = line.strip_prefix("Program log: ") {
        return rest.to_string();
    }
    // Skip noisy runtime lines
    if line.contains("BPF program ") || line.contains("Program invoke") || line.contains("Program returned") {
        return String::new();
    }
    line.to_string()
}

#[tokio::main]
async fn main() {
    task::spawn(async move {
        if let Err(e) = listen_for_slash_events().await {
            eprintln!("Slash listener exited with error: {e:?}");
        }
    });

    let app = new_router();

    let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();
    println!("The server is run over http://localhost:3000");
    axum::serve(listener, app).await.unwrap();
}

async fn listen_for_slash_events() -> anyhow::Result<()> {
    let http_url = std::env::var("SOLANA_HTTP_URL").unwrap_or_else(|_| "https://api.devnet.solana.com".to_string());
    let program_id = restaking_programs::id();
    let (treasury_pda, _treasury_bump) = Pubkey::find_program_address(
        &[b"reward_treasury"],
        &Pubkey::new_from_array(program_id.to_bytes()),
    );
    // Optional: also watch operator's vault PDA if OPERATOR_OWNER is provided
    let vault_pda = std::env::var("OPERATOR_OWNER")
        .ok()
        .and_then(|s| s.parse::<Pubkey>().ok())
        .map(|owner|
            Pubkey::find_program_address(&[b"vault", owner.as_ref()], &Pubkey::new_from_array(program_id.to_bytes())).0
        );
    let client = RpcClient::new_with_commitment(http_url.clone(), CommitmentConfig::confirmed());

    println!(
        "Polling for OperatorSlashedEvent logs touching treasury {} via {}",
        treasury_pda, http_url
    );

    let mut last_seen_sig: Option<String> = None;

    loop {
        let mut sigs = client
            .get_signatures_for_address(&treasury_pda)
            .unwrap_or_default();
        if let Some(vault) = vault_pda {
            // Merge vault sigs too
            let mut vs = client.get_signatures_for_address(&vault).unwrap_or_default();
            sigs.append(&mut vs);
            sigs.sort_by(|a,b| b.slot.cmp(&a.slot)); // newest first
            sigs.dedup_by(|a,b| a.signature == b.signature);
        }

        if !sigs.is_empty() {
            let mut new_count = 0usize;
            for info in sigs.iter() {
                if let Some(ref last) = last_seen_sig {
                    if &info.signature == last { break; }
                }
                new_count += 1;
            }

            for info in sigs.iter().take(new_count).rev() {
                if let Ok(tx) = client.get_transaction_with_config(
                    &info.signature.parse().unwrap_or_default(),
                    RpcTransactionConfig {
                        encoding: None,
                        commitment: Some(CommitmentConfig::confirmed()),
                        max_supported_transaction_version: Some(0),
                    },
                ) {
                    if let Some(meta) = tx.transaction.meta {
                        match meta.log_messages {
                            OptionSerializer::Some(logs) => {
                                // Debug: print all logs if requested
                                if std::env::var("DEBUG_LISTENER").ok().as_deref() == Some("1") {
                                    println!("-- tx {} logs --", info.signature);
                                    for l in &logs { println!("{}", format_log_line(l)); }
                                }
                                parse_and_notify(&logs);
                            }
                            _ => {}
                        }
                    }
                }
            }
            last_seen_sig = sigs.first().map(|s| s.signature.clone());
        }

        tokio::time::sleep(std::time::Duration::from_secs(3)).await;
    }
}

fn extract_number(s: &str) -> Option<u64> {
    let mut digits = String::new();
    for ch in s.chars() {
        if ch.is_ascii_digit() {
            digits.push(ch);
        } else if !digits.is_empty() {
            break;
        }
    }
    digits.parse::<u64>().ok()
}

fn parse_and_notify(log_lines: &[String]) {
    let mut saw_event = false;
    let mut operator_owner: Option<String> = None;
    let mut slashed_amount: Option<u64> = None;
    let mut remaining_bond: Option<u64> = None;

    for line in log_lines.iter() {
        if line.contains("OperatorSlashedEvent") {
            saw_event = true;
        }
        // Also detect based on CPI and explicit slash info in logs
        if line.contains("Instruction: SlashOperator") || line.contains("Operator wrong! Slashing via CPI") {
            saw_event = true;
        }
        if line.contains("Operator slashed") {
            // Example: "Operator slashed 200000000 lamports ..."
            if let Some(idx) = line.find("Operator slashed") {
                if let Some(num) = extract_number(&line[idx..]) { slashed_amount = Some(num); }
            }
        }
        if line.contains("slashed_amount") || line.contains("remaining_bond") || line.contains("operator_owner") {
            if let Some(idx) = line.find("slashed_amount:") {
                if let Some(num) = extract_number(&line[idx + "slashed_amount:".len()..]) {
                    slashed_amount = Some(num);
                }
            }
            if let Some(idx) = line.find("remaining_bond:") {
                if let Some(num) = extract_number(&line[idx + "remaining_bond:".len()..]) {
                    remaining_bond = Some(num);
                }
            }
            if let Some(idx) = line.find("operator_owner:") {
                let tail = line[idx + "operator_owner:".len()..].trim();
                operator_owner = tail.split_whitespace().next().map(|s| s.trim_matches(',').to_string());
            }
        }
    }

    if saw_event {
        println!(
            "[NOTIFY] OperatorSlashedEvent detected: operator_owner={:?}, slashed_amount={:?}, remaining_bond={:?}",
            operator_owner, slashed_amount, remaining_bond
        );
    }
}
