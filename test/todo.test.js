import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { JSDOM } from 'jsdom';

// Ladataan HTML ja app.js
const html = readFileSync('./public/index.html', 'utf8');

describe('Todo App (Vitest + jsdom)', () => {
  let dom;
  let document;
  let window;

  beforeEach(async () => {
    // Luo DOM-ympäristö
    dom = new JSDOM(html, {
      url: 'http://localhost/',
      runScripts: 'dangerously',
      resources: 'usable',
    });

    window = dom.window;
    document = window.document;

    // Tyhjennä localStorage
    window.localStorage.clear();

    // Lataa app.js
    await import('../public/app.js');
  });

  it('luo uuden taskin ja näyttää sen listassa', () => {
    const topic = document.getElementById('topic');
    const description = document.getElementById('description');
    const saveBtn = document.getElementById('save-btn');

    topic.value = 'Testitaski';
    description.value = 'Testitaskin kuvaus';

    // Lähetä lomake
    saveBtn.click();

    const tasks = document.querySelectorAll('#task-list .task');
    expect(tasks.length).toBe(1);

    expect(tasks[0].querySelector('.title').textContent).toContain(
      'Testitaski'
    );
    expect(tasks[0].querySelector('.desc').textContent).toContain(
      'Testitaskin kuvaus'
    );

    // localStorage tallennettu
    const stored = JSON.parse(window.localStorage.getItem('todo_tasks_v1'));
    expect(stored.length).toBe(1);
  });

  it('poistaa taskin', () => {
    const topic = document.getElementById('topic');
    const description = document.getElementById('description');
    const saveBtn = document.getElementById('save-btn');

    topic.value = 'Poistettava taski';
    description.value = 'Kuvaus';
    saveBtn.click();

    const deleteBtn = document.querySelector('button[data-action="delete"]');

    // Mockaa confirm
    window.confirm = () => true;

    deleteBtn.click();

    const tasks = document.querySelectorAll('#task-list .task');
    expect(tasks.length).toBe(0);

    expect(document.getElementById('empty-state').style.display).not.toBe(
      'none'
    );

    const stored = JSON.parse(window.localStorage.getItem('todo_tasks_v1'));
    expect(stored.length).toBe(0);
  });
});
