"use client";
import Query1 from "@/app/main/_components/query1";
import { useParams } from "next/navigation";
// import Query1 from "../_component/Query1"; // adjust path if needed

const emails = [
  {
    id: "1",
  },
  {
    id: "2",
    from: "mailingservice...",
    subject: "Your Account Password",
    message: "Hello ansh, Your password is: ecaa23be7bc4...",
    date: "Apr 12",
  },
  // more...
];

export default function ViewMailPage() {
  const { id } = useParams();
  const mail = emails.find((e) => e.id === id);

  if (!mail) return <div className="p-10">Mail not found.</div>;

  return (
    <div className="p-8 bg-white min-h-screen">
      {/* Render Query1 on top or wherever you want */}
      <Query1 />

      <h1 className="text-xl font-bold mb-2">{mail.subject}</h1>
      <p className="text-sm text-gray-500 mb-4">
        From: {mail.from} | Date: {mail.date}
      </p>
      <p className="text-lg text-gray-800">{mail.message}</p>
    </div>
  );
}
