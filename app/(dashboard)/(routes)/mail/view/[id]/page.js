"use client";
import Query1 from "@/app/main/_components/query1";
import Query2 from "@/app/main/_components/query2"; // Import Query2
import { useParams } from "next/navigation";

const emails = [
  { id: "1" },
  {
    id: "2",
    from: "mailingservice...",
    subject: "Your Account Password",
    message: "Hello ansh, Your password is: ecaa23be7bc4...",
    date: "Apr 12",
  },
  {
    id: "3",
    from: "Share.io@gmail.com",
    // subject: "",
    message: "get free premium of unlimited file Upload!",
    date: "Aug 14",
  },
];

export default function ViewMailPage() {
  const { id } = useParams();
  const mail = emails.find((e) => e.id === id);

  if (!mail) return <div className="p-10">Mail not found.</div>;

  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Conditionally render Query1 or Query2 */}
      {id === "3" ? <Query2 /> : <Query1 />}

      <h1 className="text-xl font-bold mb-2">{mail.subject}</h1>
      <p className="text-lg text-gray-800">{mail.message}</p>
    </div>
  );
}
