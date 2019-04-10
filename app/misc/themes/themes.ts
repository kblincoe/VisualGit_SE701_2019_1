import { Blue } from './blue';
import { Default } from './default';
import { Green } from './green';
import { ITheme } from './itheme';
import { Navy } from './navy';
import { Pink } from './pink';
import { White } from './white';

export const Themes = {
  White,
  Blue,
  Green,
  Default,
  Navy,
  Pink,
  apply: function(theme: ITheme) {
    const navbarElements = document.getElementsByClassName('navbar');
    const icons = document.getElementsByClassName('fa');
    const filePanel = document.getElementById('file-panel');
    const paragraphs = document.getElementsByTagName('p');
    const headings = document.getElementsByTagName('h1');
    const diffPanel = document.getElementById('diff-panel-body');
    const network = document.getElementById('my-network');
    const footer = document.getElementById('footer');
    const repositoryPanel = document.getElementById('add-repository-panel');
    const authenticateElement = document.getElementById('authenticate');
    const navbarToggle = document.getElementById('navbarToggle');

    for (let i = 0; i < navbarElements.length; ++i) {
      navbarElements[i].className = theme.navbarClass;
    }

    for (let i = 0; i < icons.length; ++i) {
      icons[i].setAttribute('style', `color: ${theme.iconColor}`);
    }

    if (filePanel) {
      filePanel.style.backgroundColor = theme.filePanelColor;
    }

    for (let i = 0; i < paragraphs.length; ++i) {
      paragraphs[i].style.color = theme.paragraphColor;
    }

    for (let i = 0; i < headings.length; ++i) {
      headings[i].style.color = theme.headingColor;
    }

    if (diffPanel) {
      diffPanel.style.color = theme.diffPanelColor;
      diffPanel.style.backgroundColor = theme.diffPanelBackgroundColor;
    }

    if (network) {
      network.style.backgroundColor = theme.networkColor;
    }

    if (footer) {
      footer.style.backgroundColor = theme.footerColor;
    }

    if (repositoryPanel) {
      repositoryPanel.style.backgroundColor = theme.repositoryPanelColor;
    }

    if (authenticateElement) {
      authenticateElement.style.backgroundColor = theme.authenticateColor;
    }

    if (navbarToggle) {
      navbarToggle.style.backgroundColor = theme.navbarToggleColor;
    }
  },
};
