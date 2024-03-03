import React, { useState, ChangeEvent, FormEvent } from "react";

interface IWaitlistForm {
  email: string;
}

const SalesPage: React.FC = () => {
  const [form, setForm] = useState<IWaitlistForm>({ email: "" });

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [event.target.name]: event.target.value });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Logic to add email to waiting list
    console.log(form.email); // Replace with actual submission logic
    alert("Thank you for joining our exclusive waiting list!");
  };

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-4xl font-bold text-center my-10">
        Take Your Crypto Trading to the Next Level
      </h1>
      <p className="text-lg text-center">
        Join our exclusive waiting list to gain early access to the most
        comprehensive trading analytics platform. Understand your trading
        behavior, optimize your strategies, and maximize your profits with our
        advanced insights.
      </p>
      <div className="my-10">
        <h2 className="text-3xl font-bold my-5">Why Join Us?</h2>
        <ul className="list-disc list-inside">
          <li>
            Unified portfolio overview across all exchanges and blockchains
          </li>
          <li>Detailed analytics on your trading performance</li>
          <li>
            Insights into profitable and non-profitable trading strategies
          </li>
          <li>Personalized recommendations to improve your trading outcomes</li>
        </ul>
      </div>
      <div className="my-10">
        <h2 className="text-3xl font-bold my-5">Be Part of the Revolution</h2>
        <form className="flex flex-col items-center" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Enter your email to join the waiting list"
            className="px-4 py-2 border rounded-lg text-lg"
            value={form.email}
            onChange={handleChange}
            required
          />
          <button
            type="submit"
            className="mt-4 bg-blue-500 text-white py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Join the Waiting List
          </button>
        </form>
      </div>
    </div>
  );
};

export default SalesPage;
