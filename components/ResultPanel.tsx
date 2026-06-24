export default function ResultPanel({ result }: any) {
  if (!result) return null

  return (
    <div className="mt-6 p-4 border rounded-xl">
      <h2 className="text-xl font-bold">AI Output</h2>

      <p><b>Estimated Time:</b> {result.time_minutes} minutes</p>

      <h3 className="mt-2 font-semibold">Advice:</h3>
      <ul className="list-disc ml-5">
        {result.advice.map((item: string, i: number) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  )
}