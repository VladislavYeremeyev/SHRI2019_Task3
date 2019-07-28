if (document.body) {
  document.body.addEventListener('click', function (e) {
    let { target } = e;

    while (target !== this) {
      if (target.classList.contains('e-accordion__short')) {
        const parent = target.closest('.e-accordion');

        if (!parent) {
          return;
        }
        const hiddenPart = parent.getElementsByClassName('e-accordion__more');
        if (hiddenPart.length === 0) {
          return;
        }
        hiddenPart[0].classList.toggle('e-accordion__more_displayed');

        return;
      }

      target = target.parentNode;
    }
  });
}

if (document.body) {
  document.body.addEventListener('click', function (e) {
    let { target } = e;
    const theme = document.body.getElementsByClassName('theme')[0];
    while (target !== this) {
      if (target.classList.contains('onoffswitch')) {
        const btn = target.getElementsByClassName('onoffswitch__button');
        if (btn.length === 0) {
          return;
        }
        if (theme) {
          target.classList.toggle('onoffswitch_checked');
          theme.classList.toggle('theme_color_project-default');
          theme.classList.toggle('theme_color_project-inverse');
        }

        return;
      }

      target = target.parentNode;
    }
  });
}
