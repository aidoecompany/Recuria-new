import ChatPage from "../page"

export default function ClinicPage({ params }: { params: { clinic: string } }) {

  const clinic = params.clinic
  const Page = ChatPage as any

  return (
    <div>
      <Page clinic={clinic} />
    </div>
  )
}