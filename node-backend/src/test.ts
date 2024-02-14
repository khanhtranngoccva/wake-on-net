import wol from "wake-on-lan";

console.log(wol);
wol.wake(process.argv[2] ?? "D8-5E-D3-D1-4D-9A");