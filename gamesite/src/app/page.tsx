export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      <header className="h-[30px] bg-[#191919] text-white shrink-0 border-b border-gray-800">
      </header>
      <div className="flex flex-1">
        <aside className="min-w-[50px] h-full bg-[#080808] border-r border-gray-900" />
        <main className="flex-1 bg-black" />
      </div>
    </div>
  );
}
