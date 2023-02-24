import {
  Connection,
  SystemProgram,
  Transaction,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";
export const programId = new PublicKey(
  "CuXXSsHBqpDE4zoY7T1abmcqiv6egywmEvfBrdGf8634"
);

export class CampaignDetails {
  constructor(properties) {
    Object.keys(properties).forEach((key) => {
      this[key] = properties[key];
    });
  }
  static schema = new Map([
    [
      CampaignDetails,
      {
        kind: "struct",
        fields: [
          ["admin", [32]],
          ["name", "string"],
          ["description", "string"],
          ["image_link", "string"],
          ["amount_donated", "u64"],
        ],
      },
    ],
  ]);
}
export class WithdrawRequest {
  constructor(properties) {
    Object.keys(properties).forEach((key) => {
      this[key] = properties[key];
    });
  }
  static schema = new Map([
    [
      WithdrawRequest,
      {
        kind: "struct",
        fields: [["amount", "u64"]],
      },
    ],
  ]);
}

export async function setPayerAndBlockhashTransaction(
  instructions,
  publicKey,
  connection
) {
  const transaction = new Transaction();
  instructions.forEach((element) => {
    transaction.add(element);
  });
  transaction.feePayer = publicKey;
  let hash = await connection.getLatestBlockhash();
  transaction.recentBlockhash = hash.blockhash;
  return transaction;
}

export async function signAndSendTransaction(
  transaction,
  signTransaction,
  connection
) {
  try {
    console.log("start signAndSendTransaction");

    let signedTrans = await signTransaction(transaction);
    console.log("signed transaction");
    console.log(signedTrans);
    let signature = await connection.sendRawTransaction(
      signedTrans.serialize()
    );
    console.log("end signAndSendTransaction");
    return signature;
  } catch (err) {
    console.log("signAndSendTransaction error", err);
    throw err;
  }
}
