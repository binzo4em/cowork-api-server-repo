const express = require('express')

const app = express()

const db = require('./models') // index.js 파일을 자동으로 실행

const { Member } = db

// request의 body에 json 데이터가 있는 경우 json을 추출하여
// request 객체의 body에 프로퍼티로 추가
// 라우트 핸들러에의해 처리되기 전에 추가적으로 필요한 전처리를 수행하는 함수를 미들웨어라고 한다.
app.use(express.json())

app.get('/api/members', async (req, res) => {
    // send 메소드가 배열인 members를 JSON으로 변환하여 response body에 추가하여 전송
    //res.send(members)
    const { team } = req.query
    if(team) {
        // filter : true인 요소만 새로운 배열로 생성하여 리턴
        // 내림차순 정렬 시 참고 : order: [['admissionDate', 'DESC']]
        const teamMembers = await Member.findAll({ where: { team: team } })
        res.send(teamMembers)
    }else {
        const members = await Member.findAll()
        res.send(members)
    }
})

/**
 *  /api/members/ 뒤에 오는 값을 id에 대입하라는 의미하며 id를 라우트 파라미터라 함
 */
app.get('/api/members/:id', async (req, res) => {
    // id에 대입된 값을 가져오는 방법 (Old Style)
    // const id = req.params.id

    // 오브젝트 디스트럭처링으로 가져오는 방법 (New Style)
    // 위의 const id = req.params.id 방법과 동일
    const { id } = req.params

    // 배열의 여러 요소 중에서 첫번재 요소를 리턴
    // Number(id) : id 값을 숫자형으로 변환
    // 일치하는 데이터가 없는 경우 undefined를 반환하여 udenfined는 falsy 값으로 간주됨
    const member = await Member.findOne({ where: { id: id }})

    if(member) {
        res.send(member)
    } else {
        res.status(404).send({ message: 'There is no such member with the id!'})
    }
})

app.post('/api/members', async (req, res) => {
    const newMember = req.body
    const member = Member.build(newMember)
    await member.save();
    res.send(member)
})

// app.put('/api/members/:id', async (req, res) => {
//     const { id } = req.params
//     const newInfo = req.body
//     const result = await Member.update(newInfo, { where: { id } })
//     if(result[0]) {
//         res.send({ message: `${result[0]} row(s) affected` })
//     }else {
//         res.status(404).send({ message: 'There is no member with the id!' })
//     }
// })

app.put('/api/members/:id', async (req, res) => {
    const { id } = req.params
    const newInfo = req.body
    const member = await Member.findOne({ where: { id }})
    if(member) {
        Object.keys(newInfo).forEach((prop) => {
            member[prop] = newInfo[prop]
        })
        await member.save()
        res.send(member)
    }else {
        res.status(404).send({ message: 'There is no member with the id!' })
    }
})

app.delete('/api/members/:id', async (req, res) => {
    const { id } = req.params
    const deletedCount = await Member.destroy({ where: { id }})
    if(deletedCount) {
        res.send({ message: `${deletedCount} row(s) deleted`})
    }else {
        res.status(404).send({ message: 'There is no member with the id!' })
    }
    // const membersCount = members.length
    // members = members.filter((member) => member.id !== Number(id))
    // if(members.length < membersCount) {
    //     res.send({ message: 'Deleted'})
    // }else {
    //     res.status(404).send({ message: 'There is no member with the id!' })
    // }
})

app.listen(process.env.PORT || 3000, () => {
    console.log('Server is listening...')
})