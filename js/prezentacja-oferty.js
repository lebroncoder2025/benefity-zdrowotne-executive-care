const puzzlePieces = document.querySelectorAll('.puzzle-piece');

if (puzzlePieces.length) {
  const closeFocusedPuzzlePiece = () => {
    const focusedPiece = document.querySelector('.puzzle-piece:focus');
    if (focusedPiece) focusedPiece.blur();
  };

  document.addEventListener('click', (event) => {
    if (event.target.closest('.puzzle-piece')) return;
    closeFocusedPuzzlePiece();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeFocusedPuzzlePiece();
  });
}
