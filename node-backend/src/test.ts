import wol from "wake_on_lan";
import console from "console";

wol.wake(process.argv[2] ?? "D8-5E-D3-D1-4D-9A");