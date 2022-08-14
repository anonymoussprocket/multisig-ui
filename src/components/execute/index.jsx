import { connectTezAccount, executeMultisigOperation } from "../../library/tezos";

import useStyles from "./style";

const Execute = () => {
  const classes = useStyles();
  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const client = await connectTezAccount()
      await executeMultisigOperation(client, event.target.id.value)
      alert("operation executed!")
    } catch (err) {
      console.log("Failed to submit operation", err)
      alert("Failed to submit operation")
    }
  };

  return (
    <div className={classes.container}>
      <form onSubmit={handleSubmit}>
        <label className={classes.label}>
          Operation Index:
        </label>
        <input className={classes.input} type="number" name="id" placeholder="Your Operation Index" required />
        <input className={classes.input} type="submit" value="Execute" />
      </form>
    </div>
  );
};

export default Execute;
