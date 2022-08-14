import { DAppClient, TezosOperationType } from "@airgap/beacon-sdk";
import {
  TezosConseilClient,
  TezosMessageUtils,
  TezosNodeReader,
} from "conseiljs";

import { JSONPath } from "jsonpath-plus";

const config = require(`./config.${process.env.REACT_APP_ENV || "mainnet"}.json`);

export const connectTezAccount = async () => {
  const client = new DAppClient({ name: "Multisig" });
  await client.requestPermissions({ network: { type: config.conseilServer.network } });
  const account = await client.getActiveAccount();
  return { client, account: account["address"] };
};

export const getNextOperationIndex = async () => {
  const multisigStorage = await TezosNodeReader.getContractStorage(
    config.rpc,
    config.multisigAddr
  );

  return (
    Number(
      JSONPath({ path: "$.args[0].args[0].int", json: multisigStorage })[0]
    ) + 1
  );
};

export const composeCoinTransferRequest = (
    chainId,
    operationIndex,
    sourceAddress,
    destinationAddress,
    amount
  ) => {
    return `{ "prim": "Pair", "args": [ { "bytes": "${chainId}" }, { "prim": "Pair", "args": [ { "int": "${operationIndex}" }, [ { "prim": "DROP" }, { "prim": "NIL", "args": [ { "prim": "operation" } ] }, { "prim": "PUSH", "args": [ { "prim": "address" }, { "string": "${sourceAddress}" } ] }, { "prim": "CONTRACT", "args": [ { "prim": "pair", "args": [ { "prim": "mutez" }, { "prim": "address" } ] } ], "annots": [ "%transfer" ] }, { "prim": "IF_NONE", "args": [ [ { "prim": "PUSH", "args": [ { "prim": "int" }, { "int": "3" } ] }, { "prim": "FAILWITH" } ], [] ] }, { "prim": "PUSH", "args": [ { "prim": "mutez" }, { "int": "0" } ] }, { "prim": "PUSH", "args": [ { "prim": "pair", "args": [ { "prim": "mutez" }, { "prim": "address" } ] }, { "prim": "Pair", "args": [ { "int": "${amount}" }, { "string": "${destinationAddress}" } ] } ] }, { "prim": "TRANSFER_TOKENS" }, { "prim": "CONS" } ] ] } ]}`;
  };
  
  export const packCoinTransferRequest = (
    chainId,
    operationIndex,
    sourceAddress,
    destinationAddress,
    amount
  ) => {
    const encodedChainId = TezosMessageUtils.writeBufferWithHint(chainId, 'chain_id').toString('hex');

    const transferOperation = `{ "prim": "Pair", "args": [ { "bytes": "${encodedChainId}" }, { "prim": "Pair", "args": [ { "int": "${operationIndex}" }, [ { "prim": "DROP" }, { "prim": "NIL", "args": [ { "prim": "operation" } ] }, { "prim": "PUSH", "args": [ { "prim": "address" }, { "bytes": "${TezosMessageUtils.writeAddress(sourceAddress)}" } ] }, { "prim": "CONTRACT", "args": [ { "prim": "pair", "args": [ { "prim": "mutez" }, { "prim": "address" } ] } ], "annots": [ "%transfer" ] }, { "prim": "IF_NONE", "args": [ [ { "prim": "PUSH", "args": [ { "prim": "int" }, { "int": "3" } ] }, { "prim": "FAILWITH" } ], [] ] }, { "prim": "PUSH", "args": [ { "prim": "mutez" }, { "int": "0" } ] }, { "prim": "PUSH", "args": [ { "prim": "pair", "args": [ { "prim": "mutez" }, { "prim": "address" } ] }, { "prim": "Pair", "args": [ { "int": "${amount}" }, { "bytes": "${TezosMessageUtils.writeAddress(destinationAddress)}" } ] } ] }, { "prim": "TRANSFER_TOKENS" }, { "prim": "CONS" } ] ] } ]}`;
  
    return TezosMessageUtils.writePackedData(transferOperation, '');
  };
  
  export const coinTransferRequest = (
    chainId,
    operationIndex,
    destinationAddress,
    tokenBalance
  ) => {
    return {
      operation: composeCoinTransferRequest(
        chainId,
        operationIndex,
        config.multisigAddr,
        destinationAddress,
        tokenBalance
      ),
      bytes: packCoinTransferRequest(
        chainId,
        operationIndex,
        config.multisigAddr,
        destinationAddress,
        tokenBalance
      ),
    };
  };

export const composeTransferRequest = (
  chainId,
  operationIndex,
  tokenAddress,
  destinationAddress,
  tokenBalance
) => {
  return `{ "prim": "Pair", "args": [ { "string": "${chainId}" }, { "prim": "Pair", "args": [ { "int": "${operationIndex}" }, [ { "prim": "DROP" }, { "prim": "NIL", "args": [ { "prim": "operation" } ] }, { "prim": "PUSH", "args": [ { "prim": "address" }, { "string": "${tokenAddress}" } ] }, { "prim": "CONTRACT", "args": [ { "prim": "pair", "args": [ { "prim": "address" }, { "prim": "pair", "args": [ { "prim": "address" }, { "prim": "int" } ] } ] } ], "annots": [ "%transfer" ] }, { "prim": "IF_NONE", "args": [ [ { "prim": "PUSH", "args": [ { "prim": "int" }, { "int": "10" } ] }, { "prim": "FAILWITH" } ], [] ] }, { "prim": "PUSH", "args": [ { "prim": "mutez" }, { "int": "0" } ] }, { "prim": "PUSH", "args": [ { "prim": "pair", "args": [ { "prim": "address" }, { "prim": "pair", "args": [ { "prim": "address" }, { "prim": "nat" } ] } ] }, { "prim": "Pair", "args": [ { "string": "${config.multisigAddr}" }, { "prim": "Pair", "args": [ { "string": "${destinationAddress}" }, { "int": "${tokenBalance}" } ] } ] } ] }, { "prim": "TRANSFER_TOKENS" }, { "prim": "CONS" } ] ] } ] }`;
};

export const packTransferRequest = (
  chainId,
  operationIndex,
  tokenAddress,
  destinationAddress,
  tokenBalance
) => {
  const encodedChainId = TezosMessageUtils.writeBufferWithHint(chainId, 'chain_id').toString('hex');

  const transferOperation = `{ "prim": "Pair", "args": [ { "bytes": "${encodedChainId}" }, { "prim": "Pair", "args": [ { "int": "${operationIndex}" }, [ { "prim": "DROP" }, { "prim": "NIL", "args": [ { "prim": "operation" } ] }, { "prim": "PUSH", "args": [ { "prim": "address" }, { "bytes": "${TezosMessageUtils.writeAddress(tokenAddress)}" } ] }, { "prim": "CONTRACT", "args": [ { "prim": "pair", "args": [ { "prim": "address" }, { "prim": "pair", "args": [ { "prim": "address" }, { "prim": "int" } ] } ] } ], "annots": [ "%transfer" ] }, { "prim": "IF_NONE", "args": [ [ { "prim": "PUSH", "args": [ { "prim": "int" }, { "int": "10" } ] }, { "prim": "FAILWITH" } ], [] ] }, { "prim": "PUSH", "args": [ { "prim": "mutez" }, { "int": "0" } ] }, { "prim": "PUSH", "args": [ { "prim": "pair", "args": [ { "prim": "address" }, { "prim": "pair", "args": [ { "prim": "address" }, { "prim": "nat" } ] } ] }, { "prim": "Pair", "args": [ { "bytes": "${TezosMessageUtils.writeAddress(config.multisigAddr)}" }, { "prim": "Pair", "args": [ { "bytes": "${TezosMessageUtils.writeAddress(destinationAddress)}" }, { "int": "${tokenBalance}" } ] } ] } ] }, { "prim": "TRANSFER_TOKENS" }, { "prim": "CONS" } ] ] } ] }`;

  return TezosMessageUtils.writePackedData(transferOperation, '');
};

export const tokenTransferRequest = (
  chainId,
  operationIndex,
  sourceAddress,
  destinationAddress,
  tokenBalance
) => {
  return {
    operation: composeTransferRequest(
      chainId,
      operationIndex,
      sourceAddress,
      destinationAddress,
      tokenBalance
    ),
    bytes: packTransferRequest(
      chainId,
      operationIndex,
      sourceAddress,
      destinationAddress,
      tokenBalance
    ),
  };
};

export const composeMintRequest = (
  chainId,
  operationIndex,
  destinationAddress,
  tokenBalance
) => {
  return `{ "prim": "Pair", "args": [{ "string": "${chainId}" }, { "prim": "Pair", "args": [{ "int": "${operationIndex}" }, [{ "prim": "DROP" }, { "prim": "NIL", "args": [{ "prim": "operation" }] }, { "prim": "PUSH", "args": [{ "prim": "address" }, { "string": "${config.tokenAddr}" }] }, { "prim": "CONTRACT", "args": [{ "prim": "pair", "args": [{ "prim": "address" }, { "prim": "nat" }] }], "annots": ["%mint"] }, { "prim": "IF_NONE", "args": [ [{ "prim": "PUSH", "args": [{ "prim": "int" }, { "int": "10" }] }, { "prim": "FAILWITH" }], [] ] }, { "prim": "PUSH", "args": [{ "prim": "mutez" }, { "int": "0" }] }, { "prim": "PUSH", "args": [{ "prim": "pair", "args": [{ "prim": "address" }, { "prim": "nat" }] }, { "prim": "Pair", "args": [{ "string": "${destinationAddress}" }, { "int": "${tokenBalance}" }] }] }, { "prim": "TRANSFER_TOKENS" }, { "prim": "CONS" }] ] }] }`;
};

export const packMintRequest = (
  chainId,
  operationIndex,
  destinationAddress,
  tokenBalance
) => {
  const encodedChainId = TezosMessageUtils.writeBufferWithHint(
    chainId,
    "chain_id"
  ).toString("hex");

  const mintOperation = `{ "prim": "Pair", "args": [{ "bytes": "${encodedChainId}" }, { "prim": "Pair", "args": [{ "int": "${operationIndex}" }, [{ "prim": "DROP" }, { "prim": "NIL", "args": [{ "prim": "operation" }] }, { "prim": "PUSH", "args": [{ "prim": "address" }, { "bytes": "${TezosMessageUtils.writeAddress(
    config.tokenAddr
  )}" }] }, { "prim": "CONTRACT", "args": [{ "prim": "pair", "args": [{ "prim": "address" }, { "prim": "nat" }] }], "annots": ["%mint"] }, { "prim": "IF_NONE", "args": [ [{ "prim": "PUSH", "args": [{ "prim": "int" }, { "int": "10" }] }, { "prim": "FAILWITH" }], [] ] }, { "prim": "PUSH", "args": [{ "prim": "mutez" }, { "int": "0" }] }, { "prim": "PUSH", "args": [{ "prim": "pair", "args": [{ "prim": "address" }, { "prim": "nat" }] }, { "prim": "Pair", "args": [{ "bytes": "${TezosMessageUtils.writeAddress(
    destinationAddress
  )}" }, { "int": "${tokenBalance}" }] }] }, { "prim": "TRANSFER_TOKENS" }, { "prim": "CONS" }] ] }] }`;

  return TezosMessageUtils.writePackedData(mintOperation, "");
};

export const mintRequest = (
  chainId,
  operationIndex,
  destinationAddress,
  tokenBalance
) => {
  return {
    operation: composeMintRequest(
      chainId,
      operationIndex,
      destinationAddress,
      tokenBalance
    ),
    bytes: packMintRequest(
      chainId,
      operationIndex,
      destinationAddress,
      tokenBalance
    ),
  };
};

export const composeBurnRequest = (
  chainId,
  operationIndex,
  destinationAddress,
  tokenBalance
) => {
  return `{ "prim": "Pair", "args": [{ "string": "${chainId}" }, { "prim": "Pair", "args": [{ "int": "${operationIndex}" }, [{ "prim": "DROP" }, { "prim": "NIL", "args": [{ "prim": "operation" }] }, { "prim": "PUSH", "args": [{ "prim": "address" }, { "string": "${config.tokenAddr}" }] }, { "prim": "CONTRACT", "args": [{ "prim": "pair", "args": [{ "prim": "address" }, { "prim": "nat" }] }], "annots": ["%burn"] }, { "prim": "IF_NONE", "args": [ [{ "prim": "PUSH", "args": [{ "prim": "int" }, { "int": "10" }] }, { "prim": "FAILWITH" }], [] ] }, { "prim": "PUSH", "args": [{ "prim": "mutez" }, { "int": "0" }] }, { "prim": "PUSH", "args": [{ "prim": "pair", "args": [{ "prim": "address" }, { "prim": "nat" }] }, { "prim": "Pair", "args": [{ "string": "${destinationAddress}" }, { "int": "${tokenBalance}" }] }] }, { "prim": "TRANSFER_TOKENS" }, { "prim": "CONS" }] ] }] }`;
};

export const packBurnRequest = (
  chainId,
  operationIndex,
  destinationAddress,
  tokenBalance
) => {
  const encodedChainId = TezosMessageUtils.writeBufferWithHint(
    chainId,
    "chain_id"
  ).toString("hex");

  const burnOperation = `{ "prim": "Pair", "args": [{ "bytes": "${encodedChainId}" }, { "prim": "Pair", "args": [{ "int": "${operationIndex}" }, [{ "prim": "DROP" }, { "prim": "NIL", "args": [{ "prim": "operation" }] }, { "prim": "PUSH", "args": [{ "prim": "address" }, { "bytes": "${TezosMessageUtils.writeAddress(
    config.tokenAddr
  )}" }] }, { "prim": "CONTRACT", "args": [{ "prim": "pair", "args": [{ "prim": "address" }, { "prim": "nat" }] }], "annots": ["%burn"] }, { "prim": "IF_NONE", "args": [ [{ "prim": "PUSH", "args": [{ "prim": "int" }, { "int": "10" }] }, { "prim": "FAILWITH" }], [] ] }, { "prim": "PUSH", "args": [{ "prim": "mutez" }, { "int": "0" }] }, { "prim": "PUSH", "args": [{ "prim": "pair", "args": [{ "prim": "address" }, { "prim": "nat" }] }, { "prim": "Pair", "args": [{ "bytes": "${TezosMessageUtils.writeAddress(
    destinationAddress
  )}" }, { "int": "${tokenBalance}" }] }] }, { "prim": "TRANSFER_TOKENS" }, { "prim": "CONS" }] ] }] }`;

  return TezosMessageUtils.writePackedData(burnOperation, "");
};

export const burnRequest = (
  chainId,
  operationIndex,
  destinationAddress,
  tokenBalance
) => {
  return {
    operation: composeBurnRequest(
      chainId,
      operationIndex,
      destinationAddress,
      tokenBalance
    ),
    bytes: packBurnRequest(
      chainId,
      operationIndex,
      destinationAddress,
      tokenBalance
    ),
  };
};

export const composeSetAdminRequest = (
  chainId,
  operationIndex,
  destinationAddress
) => {
  return `{ "prim": "Pair", "args": [{ "string": "${chainId}" }, { "prim": "Pair", "args": [{ "int": "${operationIndex}" }, [{ "prim": "DROP" }, { "prim": "NIL", "args": [{ "prim": "operation" }] }, { "prim": "PUSH", "args": [{ "prim": "address" }, { "string": "${config.tokenAddr}" }] }, { "prim": "CONTRACT", "args": [{ "prim": "address" }], "annots": ["%setAdministrator"] }, { "prim": "IF_NONE", "args": [ [{ "prim": "PUSH", "args": [{ "prim": "int" }, { "int": "10" }] }, { "prim": "FAILWITH" }], [] ] }, { "prim": "PUSH", "args": [{ "prim": "mutez" }, { "int": "0" }] }, { "prim": "PUSH", "args": [{ "prim": "address" }, { "string": "${destinationAddress}" }] }, { "prim": "TRANSFER_TOKENS" }, { "prim": "CONS" }] ] }] }`;
};

export const packSetAdminRequest = (
  chainId,
  operationIndex,
  destinationAddress
) => {
  const encodedChainId = TezosMessageUtils.writeBufferWithHint(
    chainId,
    "chain_id"
  ).toString("hex");

  const adminOperation = `{ "prim": "Pair", "args": [{ "bytes": "${encodedChainId}" }, { "prim": "Pair", "args": [{ "int": "${operationIndex}" }, [{ "prim": "DROP" }, { "prim": "NIL", "args": [{ "prim": "operation" }] }, { "prim": "PUSH", "args": [{ "prim": "address" }, { "bytes": "${TezosMessageUtils.writeAddress(
    config.tokenAddr
  )}" }] }, { "prim": "CONTRACT", "args": [{ "prim": "address" }], "annots": ["%setAdministrator"] }, { "prim": "IF_NONE", "args": [ [{ "prim": "PUSH", "args": [{ "prim": "int" }, { "int": "10" }] }, { "prim": "FAILWITH" }], [] ] }, { "prim": "PUSH", "args": [{ "prim": "mutez" }, { "int": "0" }] }, { "prim": "PUSH", "args": [{ "prim": "address" }, { "bytes": "${TezosMessageUtils.writeAddress(
    destinationAddress
  )}" }] }, { "prim": "TRANSFER_TOKENS" }, { "prim": "CONS" }] ] }] }`;

  return TezosMessageUtils.writePackedData(adminOperation, "");
};

export const setAdminRequest = (
  chainId,
  operationIndex,
  destinationAddress
) => {
  return {
    operation: composeSetAdminRequest(
      chainId,
      operationIndex,
      destinationAddress
    ),
    bytes: packSetAdminRequest(chainId, operationIndex, destinationAddress),
  };
};

export const submitMultisigOperation = async (
  { client, account },
  signatures,
  operation
) => {
  let params = `{ "prim": "Pair", "args": [ [ ${signatures
    .map(
      (s) =>
        `{ "prim": "Elt", "args": [{ "string": "${s.address}" }, { "string": "${s.signature}" }] }`
    )
    .join(", ")} ], ${operation} ] }`;
  const res = await interact({ client, account }, [
    {
      to: config.multisigAddr,
      amtInMuTez: 0,
      entrypoint: "submit",
      parameters: params,
    },
  ]);
  if (res.status !== "applied") {
    throw new Error("TEZOS TX FAILED");
  }
  return res;
};

export const executeMultisigOperation = async ({ client, account }, id) => {
  const res = await interact({ client, account }, [
    {
      to: config.multisigAddr,
      amtInMuTez: 0,
      entrypoint: "execute",
      parameters: `{"int": "${id}"}`,
    },
  ]);
  if (res.status !== "applied") {
    throw new Error("TEZOS TX FAILED");
  }
  return res;
};

export const getChainID = async () => {
  return TezosNodeReader.getChainId(config.rpc);
};

export const interact = async (
  { client, account },
  operations,
  extraGas = 500,
  extraStorage = 50
) => {
  try {
    let ops = [];
    operations.forEach((op) => {
      ops.push({
        kind: TezosOperationType.TRANSACTION,
        amount: op.amtInMuTez,
        destination: op.to,
        source: account,
        parameters: {
          entrypoint: op.entrypoint,
          value: JSON.parse(op.parameters),
        },
      });
    });
    const result = await client.requestOperation({
      operationDetails: ops,
    });
    console.log(result);
    const groupid = result["transactionHash"]
      .replace(/"/g, "")
      .replace(/\n/, ""); // clean up RPC output
    const confirm = await TezosConseilClient.awaitOperationConfirmation(
      config.conseilServer,
      config.conseilServer.network,
      groupid,
      2
    );
    return confirm;
  } catch (err) {
    console.error(err);
    throw err;
  }
};
