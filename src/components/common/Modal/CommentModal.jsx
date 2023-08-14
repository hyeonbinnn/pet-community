import React, { useRef, useState, useContext, useEffect } from 'react';
import * as S from './Modal.style';
import { AuthContextStore } from '../../../context/AuthContext';
import { reportComment } from '../../../api/comment';
import { deleteComment } from '../../../api/comment';
import AlertModal from './AlertModal';

const CommentModal = ({ onClose, commentId, commentList, postId, commentAuthor, setCommentList, setCommentCnt }) => {
  const modalRef = useRef();
  const { userToken, userAccountname } = useContext(AuthContextStore);
  const [isLoginUser, setIsLoginUser] = useState(false);
  const [selectedOption, setSelectedOption] = useState('');
  useEffect(() => {
    // 댓글 작성자와 현재 사용자의 계정명 비교하여 isLoginUser 값을 설정
    setIsLoginUser(userAccountname === commentAuthor); // commentId는 댓글 작성자의 계정명으로 가정
  }, [userAccountname, commentAuthor]);

  const options = [
    {
      label: '삭제',
      action: async () => {
        await fetchDelete();
        setCommentList(commentList.filter((comment) => comment.id !== commentId));
        setCommentCnt((prev) => prev - 1);
        onClose();
      },
      showCondition: isLoginUser,
    },
    {
      label: '신고하기',
      action: () => setSelectedOption('신고하기'),
      showCondition: !isLoginUser,
    },
  ];

  const closeModal = (option) => {
    if (option === '확인') {
      fetchReport();
      console.log('신고하기 완료!');
      onClose();
    }
  };

  const fetchDelete = async () => {
    console.log('postId 값:', postId);
    console.log('commentId 값:', commentId);
    try {
      await deleteComment(postId, commentId, userToken);
    } catch (error) {
      console.log('댓글 삭제 오류:', error);
      return { success: false, error: '댓글 삭제 오류' };
    }
  };

  const fetchReport = async () => {
    try {
      await reportComment(postId, commentId, userToken);
    } catch (error) {
      console.log(error);
    }
  };

  // ReportModal 컴포넌트 신고 확인 메시지 렌더링
  const renderAlertModal = () => {
    if (selectedOption === '신고하기') {
      return (
        <AlertModal
          message='신고가 완료되었습니다!'
          onClose={closeModal}
          buttons={[{ text: '확인', color: '#Fd7a6E' }]}
        />
      );
    }
    return null;
  };

  const clickOutside = (e) => {
    if (modalRef.current && modalRef.current === e.target) {
      onClose();
    }
  };

  return (
    <>
      <S.ModalBg ref={modalRef} onClick={clickOutside} style={{ pointerEvents: selectedOption ? 'none' : 'auto' }}>
        <S.Ul>
          {options.map(
            (option, index) =>
              option.showCondition && (
                <S.Li key={index}>
                  <button onClick={option.action}>{option.label}</button>
                </S.Li>
              ),
          )}
        </S.Ul>
      </S.ModalBg>
      {renderAlertModal()}
    </>
  );
};

export default CommentModal;
