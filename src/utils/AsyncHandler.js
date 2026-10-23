const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch(next);
  };
};
export { asyncHandler };


// express async function ka error catch ni krta is liyay humay phr hr api m try catch lgana prta h jo kafi boring ho jata h is liyay hum asynchandler ka aik function bna k wo hr api m cl kr latay hain