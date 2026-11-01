/* ========================================
   FAQ ACCORDION
======================================== */

document.addEventListener("DOMContentLoaded", () => {

  const faqItems =
    document.querySelectorAll(".faq-item");


  faqItems.forEach((item) => {

    const question =
      item.querySelector(".faq-question");

    const answer =
      item.querySelector(".faq-answer");

    const toggle =
      item.querySelector(".faq-toggle");


    question.addEventListener("click", () => {

      const isOpen =
        item.classList.contains("is-open");


      /* -----------------------------
         すべて閉じる
      ----------------------------- */

      faqItems.forEach((otherItem) => {

        otherItem.classList.remove("is-open");

        const otherQuestion =
          otherItem.querySelector(".faq-question");

        const otherAnswer =
          otherItem.querySelector(".faq-answer");

        const otherToggle =
          otherItem.querySelector(".faq-toggle");


        otherQuestion.setAttribute(
          "aria-expanded",
          "false"
        );

        otherAnswer.style.maxHeight = null;

        otherToggle.textContent = "＋";

      });


      /* -----------------------------
         クリックしたFAQを開く
      ----------------------------- */

      if (!isOpen) {

        item.classList.add("is-open");

        question.setAttribute(
          "aria-expanded",
          "true"
        );

        answer.style.maxHeight =
          answer.scrollHeight + "px";

        toggle.textContent = "−";

      }

    });

  });

});
