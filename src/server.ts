import app from "./app";

const port = process.env.PORT ?? "9001";


app.listen(port, () => {
  console.log(`CRM backend listening on port ${port}`);
});
