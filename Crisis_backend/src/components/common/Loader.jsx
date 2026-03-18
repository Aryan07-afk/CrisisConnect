export default function Loader() {
  return (
    <div className="loader-wrap">
      <div className="spinner" />
    </div>
  );
}

export function InlineLoader() {
  return <div className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />;
}
