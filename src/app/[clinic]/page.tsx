import ChatPage from "../page"

export default function ClinicPage({ params }: { params: { clinic: string } }) {

  const clinic = params.clinic

  return (
    <div>
      <ChatPage clinic={clinic} />
    </div>
  )
}