import React, {useEffect, useState} from "react";
import useCounter from "./useCounter";

const MAX_CAPACITY = 10;

const Accomodate = (props) => {
  const [isFull, setIsFull] = useState(false);
  const [count, increaseCount, decreaseCount] = useCounter(0);

  // 의존성 배열이 없어서 컴포넌트가 렌더링될 때마다 호출
  useEffect(() => {
    console.log("==========================");
    console.log("useEffect() is called.");
    console.log(`isFull: ${isFull}`);
  });
  // count를 의존성으로 가지고 있어, count 값이 변경될 때마다 호출
  useEffect(() => {
    setIsFull(count >= MAX_CAPACITY);
    console.log(`Current count value: ${count}`);
  }, [count]);

  return (
    <div style={{ padding: 16 }}>
      <p>{`총 ${count}명 수용했습니다.`}</p>

      <button onClick={increaseCount} disabled={isFull}>
        입장
      </button>
      <button onClick={decreaseCount}>퇴장</button>

      {isFull && <p style={{ color: "red" }}>정원이 가득찼습니다.</p>}
    </div>
  );
};
// export default Accomodate;
