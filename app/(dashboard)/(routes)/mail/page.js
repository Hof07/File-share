import Link from "next/link";

const emails = [
  {
    id: "1",
    from: "Share.io",
    subject: "Introduce To Some Thing New",
    message: "A genrative Ai feature To Make experience Greater .... ",
    date: "Apr 14",
    unread: true,
    tag: "New",
  },
  {
    id: "2",
    from: "mailingservice...",
    subject: "Your Account Password",
    message: "Hello ansh, Your password is: ecaa23be7bc4...",
    date: "Apr 12",
    unread: true,
    tag: "New",
  },
  {
    id: "3",
    from: "Share.io@gmail.com",
    subject:"Free Premium For Users!",
    message: "get free premium of unlimited file Upload!",
    date: "Aug 14",
    unread: true,
    tag: "Free "
  }
];

export default function Page() {
  return (
    <div className="p-4 bg-white min-h-screen">
      <div className="font-semibold text-lg mb-4">Inbox</div>

      <div className="border rounded-md overflow-hidden">
        {emails.map((email) => (
          <Link href={`/mail/view/${email.id}`} key={email.id}>
            <div
              className={`flex items-center px-4 py-3 border-b hover:bg-gray-50 cursor-pointer ${
                email.unread ? "font-semibold bg-gray-100" : "text-gray-700"
              }`}
            >
              <input type="checkbox" className="mr-4" />
              <span className="mr-4 text-yellow-500">★</span>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="w-1/4 truncate">{email.from}</span>
                  <span className="text-sm text-gray-500">{email.date}</span>
                </div>
                <div className="flex gap-2">
                  <span className="truncate w-1/3">{email.subject}</span>
                  <span className="truncate text-gray-500">{email.message}</span>
                  {email.tag && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 rounded-full">
                      {email.tag}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
