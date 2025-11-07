import { plansList } from '../plans/list.js';

function initPlansList(planner) {
  const plansEls = document.getElementsByClassName('plan');
  [...plansEls].forEach(plan => {
    plan.addEventListener('click', onPlanClick.bind(null, planner));
  });
}

function onPlanClick(planner, event) {
  const id = event.currentTarget.dataset.planId;
  const plan = plansList[id];

  planner.importJSON(plan);

  const plansListElement = document.getElementById('plans-list');
  plansListElement.classList.add('hidden');
}

export default initPlansList;
