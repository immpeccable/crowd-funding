import React from "react";
import { Link } from "react-router-dom";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";

export const Header = () => {
  return (
    <header className="border-b-2 mb-12 border-gray-400 py-4 flex flex-row justify-between items-center">
      <div className="flex flex-row gap-2 ">
        <Link
          className="p-4 border-2 border-gray-400 rounded-sm text-xl font-semibold"
          to="/fundings"
        >
          Fundings
        </Link>
        <Link
          className="p-4 border-2 border-gray-400 rounded-sm text-xl font-semibold"
          to="/"
        >
          Campaigns
        </Link>
      </div>
      <Link
        className="p-4 border-2 border-gray-400 rounded-sm text-xl font-semibold"
        to="create-campaign"
      >
        Create Campaign
      </Link>
      <WalletMultiButton />
    </header>
  );
};
