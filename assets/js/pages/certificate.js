async function generateCertificate() {
  const { jsPDF } = window.jspdf;
  const name = document.getElementById('nameInput').value.trim() || "Your Name";
  localStorage.setItem('studentName', name);

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [792, 612]
  });

  return new Promise((resolve) => {
    const img = new Image();
    img.src = 'LemonsCert.jpg';
    img.onload = () => {
      doc.addImage(img, 'JPEG', 0, 0, 792, 612);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(42);
      doc.setTextColor('#242754');
      doc.text(name, 410, 325, { align: 'center' });
      doc.save(`Lemonade_Boss_Certificate_${name}.pdf`);
      document.getElementById('certificateOutput').innerHTML = `<p><strong>${name}</strong><br>Congratulations on completing your lemonade stand journey!</p>`;
      document.getElementById('certificateOutput').style.display = 'block';
      resolve();
      window.location.href = 'report.html';
    };
    img.onerror = () => {
      resolve();
    };
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const nextButton = document.getElementById('nextButton');
  if (nextButton) {
    nextButton.addEventListener('click', (e) => {
      e.preventDefault();
      const name = document.getElementById('nameInput')?.value.trim();
      if (name) {
        localStorage.setItem('studentName', name);
      }
      window.location.href = 'report.html';
    });
  }
});
