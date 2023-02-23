import { PublicKey } from "@solana/web3.js";
export const programId = new PublicKey(
  "Ck2ZcxsC3A6UuGAZCnNLTHqryguuwpVfYVBgGjHb2cYd"
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
