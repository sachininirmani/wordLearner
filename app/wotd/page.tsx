import Header from "@/components/Header";
import WordOfTheDay from "@/components/WordOfTheDay";
import PushNotifications from "@/components/PushNotifications";

export default function WotdPage() {
  return (
    <main className="min-h-screen">
      <Header />
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 py-6 md:py-10 pb-16">
        <div className="mt-6 space-y-4">
          <WordOfTheDay autoLoad />
          <PushNotifications />
        </div>

        <footer className="mt-10 text-center text-sm text-slate-600">
          Tip: Enable push to get a daily Word of the Day notification.
        </footer>
      </div>
    </main>
  );
}
