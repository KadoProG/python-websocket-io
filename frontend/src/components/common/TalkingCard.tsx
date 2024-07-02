import React from "react";

import styles from "@/components/common/TalkingCard.module.scss";

interface TalkingCardProps {
  isMine?: boolean;
  nickName: string;
  message: string;
}
export const TalkingCard: React.FC<TalkingCardProps> = (props) => {
  const style: React.CSSProperties = !props.isMine
    ? { justifyContent: "left", flexDirection: "row-reverse" }
    : {};

  return (
    <div className={`${styles.TalkingCard__container}`} style={style}>
      <div>
        <p
          className={styles.TalkingCard__content_p}
          style={{
            textAlign: !props.isMine ? "left" : "right",
          }}
        >
          {props.nickName}
        </p>
        <div className={styles.TalkingCard__content}>
          <p>{props.message}</p>
        </div>
      </div>
      <div className={styles.TalkingCard__avatar}>
        <img
          src="/images/people.png"
          alt="talking_card"
          width={80}
          height={80}
        />
      </div>
    </div>
  );
};
