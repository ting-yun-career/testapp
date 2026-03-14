export default function Home() {
  return (
    <div className="flex min-h-screen">
      <aside className="min-w-[50px] h-screen bg-black-100 border-r border-gray-900" />
      <div className="flex-1 flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <main className="flex-1" />
      </div>
    </div>
  );
}
