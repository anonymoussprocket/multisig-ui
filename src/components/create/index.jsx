import { MenuItem, Select } from "@material-ui/core";
import { coinTransferRequest, connectTezAccount, getChainID, getNextOperationIndex, tokenTransferRequest } from "../../library/tezos";

import { SigningType } from "@airgap/beacon-sdk";
import { useState } from "react";
import useStyles from "./style";

const Create = () => {
  const classes = useStyles();
  const [operation, setOperation] = useState('transfer coins');
  const [opData, setOpData] = useState('operation data');
  const [sig, setSig] = useState('your signature');
  const handleChange = (event) => { setOperation(event.target.value); };

  const transferCoins = (handler) => {
    return (
        <form onSubmit={handler}>
          <label className={classes.label}>destination</label>
          <input className={classes.input} type="text" name="address" placeholder="Address" required />
          <label className={classes.label}>amount</label>
          <input className={classes.input} type="number" name="amount" placeholder="Amount" required />
          <input className={classes.input} type="submit" value="Submit" />
        </form>
      );
  }

  const transferTokens = (handler) => {
    return (
        <form onSubmit={handler}>
          <label className={classes.label}>destination</label>
          <input className={classes.input} type="text" name="address" placeholder="Address" required />
          <label className={classes.label}>token</label>
          <input className={classes.input} type="text" name="token" placeholder="Address" required />
          <label className={classes.label}>amount</label>
          <input className={classes.input} type="number" name="amount" placeholder="Amount" required />
          <input className={classes.input} type="submit" value="Submit" />
        </form>
      );
  }

  const handleCoinTransfer = async (event) => {
    event.preventDefault();
    try {
      const [chainID, opID, { client, account }] = await Promise.all([getChainID(), getNextOperationIndex(), connectTezAccount()]);
      const data = coinTransferRequest(chainID, opID, event.target.address.value, event.target.amount.value);
      const sig = await client.requestSignPayload({ signingType: SigningType.MICHELINE, payload: data.bytes });
      setSig(sig.signature);
      setOpData(data.operation);
    } catch (err) {
      console.log("Failed to create operation", err);
      alert("Failed to create operation");
    }
  };

  const handleTokenTransfer = async (event) => {
    event.preventDefault();
    try {
      const [chainID, opID, { client, account }] = await Promise.all([getChainID(), getNextOperationIndex(), connectTezAccount()]);
      const data = tokenTransferRequest(chainID, opID, event.target.token.value, event.target.address.value, event.target.amount.value);
      const sig = await client.requestSignPayload({ signingType: SigningType.MICHELINE, payload: data.bytes });
      setSig(sig.signature);
      setOpData(data.operation);
    } catch (err) {
      console.log("Failed to create operation", err);
      alert("Failed to create operation");
    }
  };

  const renderForm = () => {
    switch (operation) {
      case "transfer coins": return transferCoins(handleCoinTransfer);
      case "transfer tokens": return transferTokens(handleTokenTransfer);
      default: return transferCoins(handleCoinTransfer);
    }
  };

  return (
    <div className={classes.container}>
      <Select
        className={classes.select}
        labelId="operations"
        id="operations"
        value={operation}
        label="Operation"
        onChange={handleChange}
      >
        <MenuItem value={"transfer coins"}>transfer coins</MenuItem>
        <MenuItem value={"transfer tokens"}>transfer tokens</MenuItem>
      </Select>
      {renderForm()}
      <div className={classes.display}>
        <label>operation content</label>
        <input className={classes.input} type="text" value={opData} readOnly /><br />
        <label>signature</label>
        <input className={classes.input} type="text" value={sig} readOnly />
      </div>
    </div>
  );
};

export default Create;
