import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "public");
const port = Number(process.env.PORT || 4173);

const drivers = [
  { id: "d-ana", name: "Ana", available: true },
  { id: "d-ben", name: "Ben", available: false },
];

const vehicles = [
  { id: "v-sedan", name: "Sedan", driverId: "d-ana" },
  { id: "v-van", name: "Van", driverId: "d-ana" },
  { id: "v-truck", name: "Truck", driverId: "d-ben" },
];

const rates = {
  "v-sedan": { amount: "42.00", currency: "USD" },
  "v-truck": { amount: "80.00", currency: "USD" },
};

const bookings = [];
let sequence = 1000;

function send(response, status, body, type = "application/json; charset=utf-8") {
  const payload = typeof body === "string" ? body : JSON.stringify(body);
  response.writeHead(status, {
    "content-type": type,
    "cache-control": "no-store",
  });
  response.end(payload);
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => {
      if (chunks.length === 0) {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch (error) {
        reject(error);
      }
    });
    request.on("error", reject);
  });
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? "/", `http://127.0.0.1:${port}`);
  try {
    if (request.method === "GET" && url.pathname === "/api/drivers") {
      send(response, 200, { drivers });
      return;
    }
    if (request.method === "GET" && url.pathname === "/api/vehicles") {
      const driverId = url.searchParams.get("driverId");
      send(response, 200, {
        vehicles: vehicles.filter((vehicle) => vehicle.driverId === driverId),
      });
      return;
    }
    if (request.method === "GET" && url.pathname === "/api/rates") {
      const rate = rates[url.searchParams.get("vehicleId") ?? ""];
      if (!rate) {
        send(response, 404, { error: "No rate configured" });
        return;
      }
      send(response, 200, { rate });
      return;
    }
    if (request.method === "POST" && url.pathname === "/api/bookings") {
      const body = await readBody(request);
      const driver = drivers.find((item) => item.id === body.driverId);
      const vehicle = vehicles.find(
        (item) => item.id === body.vehicleId && item.driverId === body.driverId,
      );
      const rate = rates[body.vehicleId];
      if (!driver?.available) {
        send(response, 409, { error: "Driver is unavailable" });
        return;
      }
      if (!vehicle) {
        send(response, 400, { error: "Vehicle does not match driver" });
        return;
      }
      if (!rate) {
        send(response, 409, { error: "No rate configured" });
        return;
      }
      const booking = {
        id: `BK-${++sequence}`,
        driverId: driver.id,
        driverName: driver.name,
        vehicleId: vehicle.id,
        vehicleName: vehicle.name,
        amount: rate.amount,
        currency: rate.currency,
      };
      bookings.push(booking);
      send(response, 201, { booking });
      return;
    }
    if (request.method === "GET" && url.pathname === "/api/bookings") {
      send(response, 200, { bookings });
      return;
    }
    if (request.method === "DELETE" && url.pathname.startsWith("/api/bookings/")) {
      const id = decodeURIComponent(url.pathname.slice("/api/bookings/".length));
      const index = bookings.findIndex((booking) => booking.id === id);
      if (index === -1) {
        send(response, 404, { error: "Not found" });
        return;
      }
      bookings.splice(index, 1);
      response.writeHead(204);
      response.end();
      return;
    }
    if (request.method === "GET" && (url.pathname === "/" || url.pathname === "/index.html")) {
      const html = await readFile(join(root, "index.html"), "utf8");
      send(response, 200, html, "text/html; charset=utf-8");
      return;
    }
    send(response, 404, { error: "Not found" });
  } catch {
    send(response, 500, { error: "Server error" });
  }
});

server.listen(port, "127.0.0.1");
