// GET VERSION
// fetch('https://api.github.com/repos/ObnoxiousOliver/BetterLANiS/releases', {
//   headers: {
//     Authorization: 'Basic ' + btoa('*:' + 'TOKEN')
//   }
// })
//   .then(res => res.json())
//   .then(data => {
//     const release = data[0]
//     const asset = release.assets.filter(x => x.name.endsWith('.exe'))[0]

//     document.querySelector('.download-btn').href = asset.browser_download_url
//     document.getElementById('version').textContent = '(v' + release.tag_name + ')'
//   })
