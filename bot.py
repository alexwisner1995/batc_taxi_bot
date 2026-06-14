import telebot
from telebot.types import InlineKeyboardMarkup, InlineKeyboardButton
import sqlite3
import datetime
import random
import os

TOKEN = os.environ.get('BOT_TOKEN')  # Токен будет храниться в настройках Koyeb

bot = telebot.TeleBot(TOKEN)

# Цены
ЦЕНА_ЗА_КМ = 120
ЦЕНА_ПОСАДКА = 150

# База данных (сохраняется в файл)
conn = sqlite3.connect('batc_taxi.db', check_same_thread=False)
c = conn.cursor()
c.execute('''CREATE TABLE IF NOT EXISTS заказы 
             (id INTEGER PRIMARY KEY, user_id TEXT, откуда TEXT, куда TEXT, цена TEXT, статус TEXT, время TEXT)''')
conn.commit()

def главное_меню():
    keyboard = InlineKeyboardMarkup()
    keyboard.add(InlineKeyboardButton("🚖 ЗАКАЗАТЬ ТАКСИ", callback_data="заказ"))
    keyboard.add(InlineKeyboardButton("📜 МОИ ПОЕЗДКИ", callback_data="история"))
    keyboard.add(InlineKeyboardButton("💰 ТАРИФЫ", callback_data="тарифы"))
    return keyboard

@bot.message_handler(commands=['start'])
def start(message):
    bot.send_message(message.chat.id, 
        "🚕 *БАЦ ТАКСИ | Щербактинский район*\n\n"
        "✅ Работаем 24/7\n"
        "✅ Цена до поездки\n"
        "✅ Оплата наличными\n\n"
        "Нажмите кнопку *ЗАКАЗАТЬ ТАКСИ*",
        reply_markup=главное_меню(),
        parse_mode='Markdown')

@bot.callback_query_handler(func=lambda call: True)
def обработка_кнопок(call):
    if call.data == "заказ":
        msg = bot.send_message(call.message.chat.id, "📍 Откуда вас забрать?\nНапишите адрес:")
        bot.register_next_step_handler(msg, получить_адрес_откуда)
    elif call.data == "тарифы":
        bot.send_message(call.message.chat.id,
            "💰 *Наши тарифы*\n\n"
            "🚕 Эконом: 150тг + 120тг/км\n"
            "🚙 БАЦ-XL: 200тг + 150тг/км\n\n"
            "💵 Оплата: только наличные\n"
            "📍 Работаем: Щербактинский район",
            parse_mode='Markdown')
    elif call.data == "история":
        c.execute("SELECT * FROM заказы WHERE user_id=? ORDER BY id DESC LIMIT 5", (str(call.message.chat.id),))
        заказы = c.fetchall()
        if заказы:
            текст = "📜 *Ваши последние поездки:*\n\n"
            for заказ in заказы:
                текст += f"🚖 {заказ[2]} → {заказ[3]}\n💰 {заказ[4]} тг\n🕐 {заказ[6]}\n\n"
            bot.send_message(call.message.chat.id, текст, parse_mode='Markdown')
        else:
            bot.send_message(call.message.chat.id, "У вас пока нет поездок")

def получить_адрес_откуда(message):
    user_data = {}
    user_data['откуда'] = message.text
    msg = bot.send_message(message.chat.id, "📍 Куда едем? Напишите адрес:")
    bot.register_next_step_handler(msg, получить_адрес_куда, user_data)

def получить_адрес_куда(message, user_data):
    user_data['куда'] = message.text
    цена = ЦЕНА_ПОСАДКА + ЦЕНА_ЗА_КМ * 5
    
    клавиатура = InlineKeyboardMarkup()
    клавиатура.add(InlineKeyboardButton("✅ ПОДТВЕРДИТЬ", callback_data=f"подтвердить_{цена}_{user_data['откуда']}_{user_data['куда']}"))
    клавиатура.add(InlineKeyboardButton("❌ ОТМЕНА", callback_data="отмена"))
    
    bot.send_message(message.chat.id,
        f"🚖 *ВАША ПОЕЗДКА*\n\n"
        f"📍 Откуда: {user_data['откуда']}\n"
        f"🏁 Куда: {user_data['куда']}\n\n"
        f"💰 *Цена: {цена} тенге*\n"
        f"💵 Оплата: наличными\n\n"
        f"Подтверждаете?",
        reply_markup=клавиатура,
        parse_mode='Markdown')

@bot.callback_query_handler(func=lambda call: call.data.startswith("подтвердить_"))
def подтвердить_заказ(call):
    данные = call.data.split("_")
    цена = данные[1]
    откуда = данные[2]
    куда = данные[3]
    
    время = datetime.datetime.now().strftime("%d.%m.%Y %H:%M")
    c.execute("INSERT INTO заказы (user_id, откуда, куда, цена, статус, время) VALUES (?,?,?,?,?,?)",
              (str(call.message.chat.id), откуда, куда, цена, "завершен", время))
    conn.commit()
    
    номера = ["777 КАЗ", "888 АСТ", "999 АЛМ"]
    номер = random.choice(номера)
    
    bot.edit_message_text(
        f"✅ *ЗАКАЗ ПОДТВЕРЖДЕН!*\n\n"
        f"🚗 Водитель: Александр\n"
        f"🔢 Госномер: {номер}\n"
        f"⏱ Прибудет через 5-10 минут\n"
        f"💰 Цена: {цена} тенге (наличные)\n\n"
        f"Спасибо что выбрали БАЦ Такси! 🚕",
        chat_id=call.message.chat.id,
        message_id=call.message.message_id,
        parse_mode='Markdown')

@bot.callback_query_handler(func=lambda call: call.data == "отмена")
def отмена(call):
    bot.edit_message_text("❌ Заказ отменен", 
                          chat_id=call.message.chat.id, 
                          message_id=call.message.message_id)

print("Бот БАЦ Такси запущен!")
bot.infinity_polling()
