export async function GET() {
    try {
      const res = await fetch("https://dummyjson.com/quotes/random", {
        cache: "no-store",
      });
  
      const data = await res.json();
  
      return Response.json({
        quote: data.quote || "Stay focused, keep moving.",
      });
  
    } catch (err) {
      console.error("Quote API error:", err);
      return Response.json({
        quote: "Stay consistent. Even small steps count.",
      });
    }
  }
  