import Head from 'next/head'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Poke Brain 🌴</title>
        <meta name="description" content="ADHD-friendly task management system" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Poke Brain 🌴
        </h1>

        <p className={styles.description}>
          An ADHD-friendly task management system designed to help you stay organized 
          and never forget important tasks. Built with simplicity and focus in mind.
        </p>

        <div className={styles.grid}>
          <a href="/api/tasks" className={styles.card}>
            <h2>Tasks API &rarr;</h2>
            <p>Manage your tasks and to-dos with our simple API endpoint.</p>
          </a>

          <a href="/api/reminders" className={styles.card}>
            <h2>Reminders API &rarr;</h2>
            <p>Set up reminders to keep you on track throughout the day.</p>
          </a>

          <a href="/api/never-forget" className={styles.card}>
            <h2>Never Forget API &rarr;</h2>
            <p>Store important information you never want to lose.</p>
          </a>
        </div>

        <div className={styles.features}>
          <h3>Why Poke Brain?</h3>
          <ul>
            <li>🧠 Designed specifically for ADHD minds</li>
            <li>📱 Mobile-responsive design</li>
            <li>⚡ Fast and lightweight</li>
            <li>🔗 Simple API endpoints</li>
          </ul>
        </div>
      </main>

      <footer className={styles.footer}>
        <p>Built with ❤️ for better task management</p>
      </footer>
    </div>
  )
}
