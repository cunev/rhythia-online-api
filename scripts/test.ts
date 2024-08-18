const res = await fetch("https://development.rhythia.com/api/getProfile", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ id: 0 }),
});

console.log(await res.text());
export {};
