const res = await fetch(`https://dev.rhythia.com/api/webhook_pushStaging`, {
  method: "post",
  body: JSON.stringify({ ciSecret: "j1vQujV7m3Hmvc7gDLkCQqjFoXNCD9Xz" }),
  headers: {
    "Content-Type": "application/json",
  },
});
const txt = await res.text();
console.log(txt);
export {};
