import Link from "next/link";

const orders = [
  {
    orderNumber: "EMO-1042",
    date: "March 26, 2026",
    items: "Velvet Ruin Tee, Static Heart Ring",
    total: "$67",
    status: "Delivered",
  },
  {
    orderNumber: "EMO-1048",
    date: "March 27, 2026",
    items: "Midnight Noise Hoodie",
    total: "$80",
    status: "Processing",
  },
  {
    orderNumber: "EMO-1053",
    date: "March 28, 2026",
    items: "Silent Crowd Long Sleeve, Ashes Tote Bag",
    total: "$85",
    status: "Shipped",
  },
];

function getStatusClasses(status: string) {
  switch (status) {
    case "Delivered":
      return "border-white/30 bg-white text-black";
    case "Shipped":
      return "border-white/20 bg-zinc-700 text-white";
    case "Processing":
      return "border-white/20 bg-transparent text-white";
    default:
      return "border-white/20 bg-transparent text-white";
  }
}

export default function OrdersPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-6xl px-6 py-12 md:px-10 lg:px-12">
        <div className="mb-12 border-b border-white/20 pb-8">
          <p
            className="mb-3 text-sm uppercase tracking-[0.35em] text-white/60"
            style={{ fontFamily: "Work Sans, sans-serif" }}
          >
            Emo Store
          </p>

          <h1
            className="text-5xl uppercase tracking-wider md:text-7xl"
            style={{ fontFamily: '"Quiet Scream", "Courier New", monospace' }}
          >
            Orders
          </h1>

          <p
            className="mt-5 max-w-2xl text-base leading-7 text-white/80 md:text-lg"
            style={{ fontFamily: "Work Sans, sans-serif" }}
          >
            A simple order history page with a clean dark layout and strong typography.
          </p>
        </div>

        <div className="mb-8 flex justify-end">
          <Link
            href="/shop"
            className="rounded-full border border-white/30 px-5 py-2 text-sm transition hover:bg-white hover:text-black"
            style={{ fontFamily: "Work Sans, sans-serif" }}
          >
            Back to Shop
          </Link>
        </div>

        <div className="space-y-5">
          {orders.map((order) => (
            <article
              key={order.orderNumber}
              className="rounded-2xl border border-white/10 bg-zinc-800 p-6"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                <div>
                  <h2
                    className="text-2xl uppercase tracking-wide"
                    style={{ fontFamily: '"Courier New", monospace' }}
                  >
                    {order.orderNumber}
                  </h2>

                  <p
                    className="mt-2 text-sm text-white/65"
                    style={{ fontFamily: "Work Sans, sans-serif" }}
                  >
                    Placed on {order.date}
                  </p>
                </div>

                <span
                  className={`inline-flex w-fit rounded-full border px-4 py-2 text-xs uppercase tracking-[0.22em] ${getStatusClasses(order.status)}`}
                  style={{ fontFamily: "Work Sans, sans-serif" }}
                >
                  {order.status}
                </span>
              </div>

              <div className="mt-6 grid gap-6 border-t border-white/10 pt-6 md:grid-cols-2">
                <div>
                  <p
                    className="mb-2 text-xs uppercase tracking-[0.22em] text-white/50"
                    style={{ fontFamily: "Work Sans, sans-serif" }}
                  >
                    Items
                  </p>
                  <p
                    className="text-sm leading-7 text-white/80"
                    style={{ fontFamily: "Work Sans, sans-serif" }}
                  >
                    {order.items}
                  </p>
                </div>

                <div>
                  <p
                    className="mb-2 text-xs uppercase tracking-[0.22em] text-white/50"
                    style={{ fontFamily: "Work Sans, sans-serif" }}
                  >
                    Total
                  </p>
                  <p
                    className="text-2xl"
                    style={{ fontFamily: '"Courier New", monospace' }}
                  >
                    {order.total}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}