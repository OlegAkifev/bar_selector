from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app)  # Разрешить запросы с фронтенда

# Хранилище для словосочетаний
entries = []


@app.route('/')
def home():
    return render_template('index.html')  # Отдаёт главный HTML-файл


@app.route('/add', methods=['POST'])
def add_entry():
    data = request.json
    entries.append(data['entry'])
    return jsonify({'message': 'Entry added successfully!', 'entries': entries})


@app.route('/entries', methods=['GET'])
def get_entries():
    return jsonify({'entries': entries})


@app.route('/delete', methods=['DELETE'])
def delete_entry():
    data = request.get_json()  # Получаем данные из запроса
    entry_to_delete = data.get('entry')  # Получаем запись для удаления

    if entry_to_delete in entries:  # Проверяем, есть ли запись в списке
        entries.remove(entry_to_delete)  # Удаляем запись
        return jsonify({'success': True, 'entries': entries})  # Возвращаем обновленный список

    return jsonify({'success': False, 'message': 'Entry not found'}), 404


if __name__ == '__main__':
    app.run(debug=True)
    