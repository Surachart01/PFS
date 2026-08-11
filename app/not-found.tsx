import Link from "next/link";

export default function NotFound() {
  return (
    <main className="auth-page">
      <section className="panel auth-card">
        <div className="panel-body">
          <h1>ไม่พบหน้านี้</h1>
          <p className="muted">Resume อาจยังไม่ถูกเผยแพร่ หรือ slug ไม่ถูกต้อง</p>
          <Link className="btn btn-primary" href="/login">
            กลับไปหน้า Login
          </Link>
        </div>
      </section>
    </main>
  );
}
