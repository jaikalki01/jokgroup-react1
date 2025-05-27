import { useEffect, useState } from "react";
import axios from "axios";

const NewArrivals = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:8000/api/v1/product/new-arrivals")
      .then((res) => setProducts(res.data))
      .catch((err) => console.error("Error loading new arrivals", err));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">New Arrivals</h1>
      {products.length === 0 ? (
        <p>No new arrivals yet.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <div key={product.id} className="border p-4 rounded shadow">
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-40 object-cover mb-2 rounded"
              />
              <h2 className="text-lg font-semibold">{product.name}</h2>
              <p className="text-sm text-gray-600">{product.description}</p>
              <p className="text-green-600 font-bold">₹{product.discount_price}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewArrivals;
