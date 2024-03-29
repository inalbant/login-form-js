class AppForm {
  constructor() {
    this.form = []
    this.step = 0
    this.currentGroup = null

    this.setListeners()
    this.getForm()
    document.getElementById('nextButton').disabled = true
    this.refresh()
    this.check()
    this.pageType = window.location.href.includes('signup') ? 'signup' : 'login'
  }

  goBack = () => {
    if (this.step > 1) {
      this.currentInput().value === ''
      this.step--
      this.displayStep()
      this.enableDisable()
    }
  }

  check = () => this.currentInput().addEventListener('keyup', this.enableDisable)

  enableDisable = () => {
    if (this.valid(this.currentInput())) {
      this.currentInput().classList.remove('invalid');
      this.setListeners();
      document.getElementById('nextButton').disabled = false
    } else {
      this.currentInput().classList.add('invalid');
      this.removeListeners()
      document.getElementById('nextButton').disabled = true
    }
  }

  valid = (input) => {
    const formType = input.id
    const value = input.value
    const empty = (str) => !str.split('').every(_char => _char !== ' ')

    if (!value || empty(value))
      return false

    if (this.pageType === 'login') return value && !empty(value)

    switch (formType) {
      case 'emailInput':
        return /\S+@\S+\.\S+/.test(value)

      case 'emailVerificationInput':
        return this.previousInput().value === value

      case 'passwordInput':
        return /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9@$&!]{8,}/.test(value)

      case 'passwordVerificationInput':
        return this.previousInput().value === value

      default:
        return false
    }
  }

  refresh = () => {
    this.step++
    if (this.step <= this.form.length) {
      this.displayStep()
      this.removeListeners()
      document.getElementById('nextButton').disabled = true
      this.check()
    } else {
      this.submit()
    }
  }

  submit = () => {
    const un = document.getElementById('emailInput').value
    const pw = document.getElementById('passwordInput').value

    console.log('pw is ' + pw)
    if (this.pageType === 'login') {
      firebase.auth().signInWithEmailAndPassword(un, pw).then(res => {
        document.getElementById('errorMessage').innerHTML = ''
        window.location.href = '/loggedin.html#' + res.user.email
      }, err => {
        document.getElementById('errorMessage').innerHTML = 'Incorrect login info.'
      })
    } else if (this.pageType === 'signup') {
      console.log(un)
      firebase.auth().createUserWithEmailAndPassword(un, pw).then(res => {
        window.location.href = '/loggedin.html#' + res.user.email
      })
    }
  }

  currentInput = () => this.form[this.step - 1].input
  previousInput = () => this.form[this.step - 2].input

  displayStep = () => {
    if (this.currentGroup) {
      this.currentGroup.style.display = 'none'
    }
    this.currentGroup = this.form.find(_group => _group.step === this.step).element
    this.currentGroup.style.display = 'block'
  }

  getForm = () => {
    const groups = Array.from(document.getElementsByClassName('form-group'))
    groups.forEach(_group => {
      const children = Array.from(_group.children)
      this.form.push({
        'step': Number.parseInt(_group.dataset.step),
        'element': _group,
        'input': children.find(_el => _el.nodeName === 'INPUT')
      })
    })
  }

  setListeners = () => {
    document.getElementById('nextButton').addEventListener('click', this.refresh)
    document.getElementById('backButton').addEventListener('click', this.goBack)

  }

  removeListeners = () => {
    document.getElementById('nextButton').removeEventListener('click', this.refresh)
  }
}

new AppForm();