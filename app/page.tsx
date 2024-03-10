import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession, login, logout } from "@/lib/lib";
import Login from "@/components/login"
export default async function Home() {
  const session = await getSession();

  return (
    <main className="container relative mx-auto scroll-my-12 overflow-auto p-4 print:p-12 md:p-16">
      <section className="mx-auto w-full max-w-4xl space-y-8 dark:bg-transparent print:space-y-6">
        <form
          action={async () => {
            "use server";
            await login();
          }}
        >
          <br />
          <button type="submit">Login with Speckle</button>
        </form>
        <form
          action={async () => {
            "use server";
            await logout();
            redirect("/");
          }}
        >
          <button type="submit">Logout</button>
        </form>
        console.log(session)
        <pre>{JSON.stringify(session, "nothing", 2)}</pre>
      </section>
      <section className="mx-auto w-full max-w-4xl space-y-8 dark:bg-transparent print:space-y-6">

      <Login/>
      </section>

    </main>
  );
}
