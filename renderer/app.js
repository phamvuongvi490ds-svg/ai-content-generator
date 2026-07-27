function showTab(n) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  const btns = document.querySelectorAll('.tab');
  if(btns[n-1]) btns[n-1].classList.add('active');
  const target = document.getElementById('tab' + n);
  if(target) target.classList.add('active');
}

document.getElementById('saveApiBtn')?.addEventListener('click', () => {
    alert("Đã lưu API!");
});
