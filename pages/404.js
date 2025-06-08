import Head from "next/head";
import Image from "next/image";

import styles from "../styles/404Page.module.css";

export default function Custom404() {
  return (
    <div className={styles.outerDiv}>
      <Head>
        <title>404 Not Found</title>
        <link rel="icon" type="image/x-icon" href="/favicon.png" />
      </Head>

      <div className={styles.avatar}></div>

      {/* 添加图片区域 */}
      <div className={styles.imageWrapper}>
      <img
  src="/assets/images/404.png"
  alt="404图片"
  width={850}
  height={850}
  style={{ borderRadius: "12px", opacity: 0.9 }}
/>
      </div>

      <h1 className="display-6 my-3" style={{ color: "#1D0C26" }}>
        未找到该页面~
      </h1>

      <div>
        <h1 className={styles.num404}>404</h1>
        <div className={styles.text404Div}>
          <h2 className={styles.text404}>This page could not be found.</h2>
        </div>
      </div>
    </div>
  );
}
