const modal = document.getElementById('modal');
const closeModal = document.getElementById('closeModal');
const image = document.getElementsByClassName('image');


function visualizarLegenda(){
    if(modal.classList.contains('modal')){
        modal.classList.remove('modal')
    }
}

closeModal.addEventListener('click', function (){
    modal.classList.add('modal')
})
