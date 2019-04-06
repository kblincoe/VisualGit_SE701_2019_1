function addCommand(command) {
  const gitCommand = document.createElement('p');
  gitCommand.className = 'git-command';
  gitCommand.id = 'git-command';
  gitCommand.innerHTML = command;
  const footer = document.getElementById('footer');
  footer.appendChild(gitCommand);
  gitCommand.scrollIntoView();
}
