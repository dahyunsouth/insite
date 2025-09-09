import React, { useState, useRef, useCallback } from "react";
import OtpCell from "@/components/atoms/Auth/InputBox/OtpCell";

// Molecule: OtpGroup with full functionality
// Spec: multiple OtpCell arranged in a row, 5px gap between each
// Features: auto-focus next, backspace to previous, paste support

export type OtpGroupProps = {
  length?: number; // default 6 cells
  className?: string;
  onComplete?: (otp: string) => void; // callback when all cells are filled
};

const OtpGroup: React.FC<OtpGroupProps> = ({ 
  length = 6, 
  className = "",
  onComplete 
}) => {
  const [values, setValues] = useState<string[]>(new Array(length).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = useCallback((index: number, value: string) => {
    setValues(prev => {
      const newValues = [...prev];
      newValues[index] = value;
      return newValues;
    });

    // 다음 칸으로 자동 이동
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // 모든 칸이 채워졌는지 확인
    const newValues = [...values];
    newValues[index] = value;
    if (newValues.every(v => v !== "") && onComplete) {
      onComplete(newValues.join(""));
    }
  }, [length, onComplete, values]);

  const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      // 현재 칸이 비어있고 2번째 칸 이상이면 이전 칸으로 이동
      if (!values[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else if (values[index]) {
        // 현재 칸에 값이 있으면 지우기
        handleChange(index, "");
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }, [values, handleChange, length]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, ""); // 숫자만 추출
    
    if (digits.length > 0) {
      const newValues = new Array(length).fill("");
      const digitsToUse = digits.slice(0, length); // 최대 length개까지만
      
      for (let i = 0; i < digitsToUse.length; i++) {
        newValues[i] = digitsToUse[i];
      }
      
      setValues(newValues);
      
      // 마지막 입력된 칸으로 포커스 이동
      const lastFilledIndex = Math.min(digitsToUse.length - 1, length - 1);
      inputRefs.current[lastFilledIndex]?.focus();
      
      // 모든 칸이 채워졌는지 확인
      if (digitsToUse.length === length && onComplete) {
        onComplete(digitsToUse);
      }
    }
  }, [length, onComplete]);

  const handleFocus = useCallback((index: number) => {
    // 포커스 시 해당 칸의 텍스트 선택
    inputRefs.current[index]?.select();
  }, []);

  return (
    <div className={`flex gap-[5px] ${className}`}>
      {Array.from({ length }).map((_, idx) => (
        <OtpCell
          key={idx}
          ref={(el) => (inputRefs.current[idx] = el)}
          index={idx + 1}
          value={values[idx]}
          onChange={(value) => handleChange(idx, value)}
          onFocus={() => handleFocus(idx)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  );
};

export default OtpGroup;
