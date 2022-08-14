import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  menu: { display: "flex", margin: "0 auto" },
  menuItem: {
    color: "black",
    display: "block",
    fontSize: "2vw",
    margin: "1vw 2vw 2vw 2vw",
    "&:hover": {
      textDecoration: "none",
    },
  },
  title: {
    fontSize: "5vw",
    margin: "2.5vw 1vw 1vw 1vw",
  },
  header: {
    display: "flex",
    justifyContent: "center",
  },
  wallet: {
    border: "0.2vw solid black",
    borderRadius: "0.3vw",
    width: "50%",
    margin: "2.5vw auto",
    padding: "1vw",
    background: "black",
    color: "white",
    fontWeight: "bold",
    textTransform: "none",
    fontSize: "1.1vw",
    "&:hover": {
      cursor: "pointer",
      background: "white",
      color: "black",
    },
  },
  box: { width: "30%" },
  container: {
    flexGrow: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-evenly",
  },
}));

export default useStyles;
