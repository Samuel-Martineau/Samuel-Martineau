<div align="middle">
  <img height="225" alt="avatar" src="https://raw.githubusercontent.com/Samuel-Martineau/Samuel-Martineau/master/avatar.png">
  <h1>Samuel Martineau</h1>
  <h3>Étudiant de niveau secondaire passionné par l'informatique !</h3>
</div>

## À propos de moi

Je suis un étudiant québécois de niveau secondaire passionné par l’informatique. J’ai davantage travaillé en JS et en TS, mais j’ai aussi expérimenté avec d’autres languages, dont le C# et le C++. J’ai aussi présenté deux projets informatique à [expo-sciences](https://technoscience.ca/programmes/expo-sciences/), qui ont tous deux été nominés. Mes repos Github sont majoritairement en Français, mais certains sont en Anglais.

## Mes compétences

{{> devicon icon='HTML5'}}
{{> devicon icon='CSS3'}}
{{> devicon icon='JavaScript'}}
{{> devicon icon='TypeScript'}}
{{> devicon icon='NodeJS'}}
{{> devicon icon='Linux'}}
{{> devicon icon='Apple'}}
{{> devicon icon='Python'}}
{{> devicon icon='RaspberryPi'}}

##### Icônes fournis par [Devicon](https://konpa.github.io/devicon/)

## Activité GitHub récente

{{#each recentGithubEvents}}
- {{this}}
{{/each}}

## Mes paquets NPM

| Paquet | Nombre de téléchargements |
| ------ | ------------------------: |
{{#each npmPackages.stats}}
|{{this.[0]}}|{{this.[1]}}|
{{/each}}
|**Total**|{{npmPackages.sum}}|

## Me contacter

Il est possible de me contacter par courriel ([samumartineau@gmail.com](mailto:samumartineau@gmail.com))

## Inspiré par
- [awesome-github-profile-readme](https://github.com/abhisheknaiidu/awesome-github-profile-readme)
- [github-activity-readme](https://github.com/jamesgeorge007/github-activity-readme)
- [How I Built A Self-Updating README On My Github Profile](https://www.mokkapps.de/blog/how-i-built-a-self-updating-readme-on-my-git-hub-profile/)
