//
//  TeamPlayMenuView.swift
//  Inertia
//
//  Created by peony on 03/04/2024.
//

import Foundation
import UIKit
import SwiftUI

final class ContentSizedTableView: UITableView {
    override var contentSize:CGSize {
        didSet {
            invalidateIntrinsicContentSize()
        }
    }

    override var intrinsicContentSize: CGSize {
        layoutIfNeeded()
        return CGSize(width: UIView.noIntrinsicMetric,
                     height: contentSize.height + adjustedContentInset.top)
    }
}

class TeamPlayQuestCell: UITableViewCell {
    var questImage = UIImageView()
    var titleLabel = UILabel()
    var rewardLabel = UILabel()
    var descriptionLabel = UILabel()
    
    override init(style: UITableViewCell.CellStyle, reuseIdentifier: String?) {
        super.init(style: style, reuseIdentifier: reuseIdentifier)
        
        contentView.backgroundColor = UIColor(Color.bgSecondary)
        
        let questImgData = UIImage(imageLiteralResourceName: "MainQuest")
        questImage.image = questImgData
        questImage.translatesAutoresizingMaskIntoConstraints = false
        
        titleLabel.font = .systemFont(ofSize: 20, weight: .bold)
        titleLabel.textColor = UIColor(Color.colorPrimary)
        titleLabel.addCharacterSpacing()
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        
        rewardLabel.font = .systemFont(ofSize: 16, weight: .regular)
        rewardLabel.textColor = UIColor(Color.colorSecondary)
        rewardLabel.translatesAutoresizingMaskIntoConstraints = false
        
        descriptionLabel.font = .systemFont(ofSize: 18, weight: .regular)
        descriptionLabel.textColor = UIColor(Color.colorSecondaryLighter)
        descriptionLabel.addCharacterSpacing()
        descriptionLabel.numberOfLines = 999
        descriptionLabel.lineBreakMode = .byWordWrapping
        descriptionLabel.lineBreakStrategy = .pushOut
        descriptionLabel.translatesAutoresizingMaskIntoConstraints = false
        
        contentView.addSubview(titleLabel)
        contentView.addSubview(rewardLabel)
        contentView.addSubview(descriptionLabel)
        contentView.addSubview(questImage)
        
        NSLayoutConstraint.activate([
            questImage.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 10),
            questImage.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 10),
            titleLabel.topAnchor.constraint(equalTo: contentView.topAnchor, constant: 10),
            titleLabel.leadingAnchor.constraint(equalTo: questImage.trailingAnchor, constant: 10),
            rewardLabel.leadingAnchor.constraint(equalTo: questImage.trailingAnchor, constant: 10),
            rewardLabel.topAnchor.constraint(equalTo: titleLabel.bottomAnchor),
            descriptionLabel.topAnchor.constraint(equalTo: questImage.bottomAnchor, constant: 10),
            descriptionLabel.leadingAnchor.constraint(equalTo: contentView.leadingAnchor, constant: 10),
            descriptionLabel.trailingAnchor.constraint(equalTo: contentView.trailingAnchor, constant: -10),
            descriptionLabel.bottomAnchor.constraint(equalTo: contentView.bottomAnchor, constant: -10)
        ])
    }
    
    required init?(coder: NSCoder) {
        fatalError("not implemented")
    }
}

class TeamPlayMenuController: UIViewController, UIAdaptivePresentationControllerDelegate, UISheetPresentationControllerDelegate, UITableViewDelegate, UITableViewDataSource {
    var team: Team?
    var quests: [ActiveQuest] = []
    var pinnedQuestIdx = -1
    var shouldHide = false
    
    var pinnedQuest: ActiveQuest? {
        if pinnedQuestIdx == -1 {
            return nil
        }
        
        return quests[pinnedQuestIdx]
    }
    
    var teamNameLabel = UILabel()
    var teamXpLabel = UILabel()
    var balanceLabel = UILabel()
    var dollarBalanceLabel = UILabel()
    var ticketBuyButton = UIButton()
    var ticketBuyVC = TicketBuyController()
    
    var questsTableHeader = UILabel()
    var questsTable = ContentSizedTableView()
    
    override func viewDidLoad() {
        view.backgroundColor = UIColor(Color.bg)
        
        ticketBuyVC.team = team
        
        teamNameLabel.translatesAutoresizingMaskIntoConstraints = false
        teamNameLabel.text = team?.name
        teamNameLabel.font = .boldSystemFont(ofSize: 24)
        teamNameLabel.textColor = UIColor(Color.colorPrimary)
        teamNameLabel.addCharacterSpacing()
        
        view.addSubview(teamNameLabel)
        NSLayoutConstraint.activate([
            teamNameLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            teamNameLabel.topAnchor.constraint(equalTo: view.topAnchor, constant: 20)
        ])
        
        teamXpLabel.translatesAutoresizingMaskIntoConstraints = false
        teamXpLabel.text = "\((team?.isRunner ?? false) ? "Runner" : "Hunter")  •  \(team?.xp ?? 0) XP"
        teamXpLabel.font = .systemFont(ofSize: 17)
        teamXpLabel.addCharacterSpacing()
        teamXpLabel.textColor = UIColor(Color.colorSecondary)
        
        view.addSubview(teamXpLabel)
        NSLayoutConstraint.activate([
            teamXpLabel.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            teamXpLabel.topAnchor.constraint(equalTo: teamNameLabel.bottomAnchor)
        ])
        
        balanceLabel.translatesAutoresizingMaskIntoConstraints = false
        balanceLabel.text = "\(team?.balance ?? 0)"
        balanceLabel.font = .boldSystemFont(ofSize: 46)
        balanceLabel.textColor = UIColor(Color.colorPrimary)
        balanceLabel.addCharacterSpacing()
        
        view.addSubview(balanceLabel)
        NSLayoutConstraint.activate([
            balanceLabel.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20),
            balanceLabel.topAnchor.constraint(equalTo: view.topAnchor, constant: 20)
        ])
        
        dollarBalanceLabel.translatesAutoresizingMaskIntoConstraints = false
        dollarBalanceLabel.text = "$"
        dollarBalanceLabel.font = .boldSystemFont(ofSize: 24)
        dollarBalanceLabel.textColor = UIColor(Color.colorPrimary)
        dollarBalanceLabel.addCharacterSpacing()
        
        view.addSubview(dollarBalanceLabel)
        NSLayoutConstraint.activate([
            dollarBalanceLabel.rightAnchor.constraint(equalTo: balanceLabel.leftAnchor),
            dollarBalanceLabel.bottomAnchor.constraint(equalTo: balanceLabel.bottomAnchor, constant: -4)
        ])
        
        ticketBuyButton.addTarget(self, action: #selector(showTicketBuyController), for: .touchUpInside)
        var conf = UIButton.Configuration.plain()
        conf.contentInsets = NSDirectionalEdgeInsets(top: 10, leading: 10, bottom: 10, trailing: 10)
        ticketBuyButton.configuration = conf
        let ticketBuyImage = UIImage(systemName: "wallet.pass.fill")?.withTintColor(UIColor(Color.colorPrimary))
        ticketBuyButton.setImage(ticketBuyImage, for: .normal)
        ticketBuyButton.backgroundColor = UIColor(Color.bgSecondary)
        ticketBuyButton.translatesAutoresizingMaskIntoConstraints = false
        
        view.addSubview(ticketBuyButton)
        NSLayoutConstraint.activate([
            ticketBuyButton.rightAnchor.constraint(equalTo: view.rightAnchor, constant: -20),
            ticketBuyButton.topAnchor.constraint(equalTo: balanceLabel.bottomAnchor, constant: 10),
            ticketBuyButton.widthAnchor.constraint(equalTo: ticketBuyButton.heightAnchor)
        ])
        
        questsTableHeader.text = "TASKS"
        questsTableHeader.font = .systemFont(ofSize: 16, weight: .bold)
        questsTableHeader.textColor = UIColor(Color.colorSecondary)
        questsTableHeader.addCharacterSpacing()
        questsTableHeader.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(questsTableHeader)
        NSLayoutConstraint.activate([
            questsTableHeader.topAnchor.constraint(equalTo: ticketBuyButton.bottomAnchor, constant: 40),
            questsTableHeader.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20)
        ])
        
        questsTable.register(TeamPlayQuestCell.self, forCellReuseIdentifier: "questCell")
        questsTable.dataSource = self
        questsTable.delegate = self
        questsTable.translatesAutoresizingMaskIntoConstraints = false
        questsTable.isScrollEnabled = false
        questsTable.setNeedsLayout()
        questsTable.layoutIfNeeded()
        questsTable.separatorColor = UIColor(Color.colorSecondary)
        view.addSubview(questsTable)
        NSLayoutConstraint.activate([
            questsTable.topAnchor.constraint(equalTo: questsTableHeader.bottomAnchor, constant: 5),
            questsTable.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 20),
            questsTable.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -20)
        ])
        questsTable.layer.cornerRadius = 10
        
        super.viewDidLoad()
    }
    
    override func viewDidLayoutSubviews() {
        super.viewDidLayoutSubviews()
        
        ticketBuyButton.layer.cornerRadius = 0.5 * ticketBuyButton.bounds.size.width
        ticketBuyButton.clipsToBounds = true
    }
    
    override func viewWillAppear(_ animated: Bool) {
        super.viewWillAppear(true)
        
        if let presentationController = presentationController as? UISheetPresentationController {
            presentationController.detents = [
                .custom(identifier: .init("small"), resolver: { ctx in
                    (self.presentingViewController?.view.frame.height ?? 0) * 0.1
                }),
                .custom(identifier: .medium, resolver: { ctx in
                    (self.presentingViewController?.view.frame.height ?? 0) * 0.33
                }),
                .custom(resolver: { ctx in
                    (self.presentingViewController?.view.frame.height ?? 0) * 0.95
                })
            ]
            
            self.ticketBuyButton.alpha = 0
            presentationController.delegate = self
            navigationController?.presentationController?.delegate = self
            presentationController.largestUndimmedDetentIdentifier = .medium
        }
    }
    
    override func viewDidAppear(_ animated: Bool) {
        super.viewDidAppear(animated)
        
        questsTable.reloadData()
    }
    
    func presentationControllerShouldDismiss(_ presentationController: UIPresentationController) -> Bool {
        false
    }
    
    func sheetPresentationControllerDidChangeSelectedDetentIdentifier(_ sheetPresentationController: UISheetPresentationController) {
        let feedback = UIImpactFeedbackGenerator(style: .light)
        feedback.impactOccurred()
        
        if sheetPresentationController.selectedDetentIdentifier == .init("small") {
            UIView.animate(withDuration: 0.15) {
                self.ticketBuyButton.alpha = 0
            }
        } else {
            UIView.animate(withDuration: 0.15) {
                self.ticketBuyButton.alpha = 1
            }
        }
    }
    
    func didMoveMap() {
//        if let presentationController = presentationController as? UISheetPresentationController {
//            presentationController.selectedDetentIdentifier = .init("small")
//        }
    }
    
    func tableView(_ tableView: UITableView, cellForRowAt indexPath: IndexPath) -> UITableViewCell {
        let cell = tableView.dequeueReusableCell(withIdentifier: "questCell", for: indexPath) as! TeamPlayQuestCell
        
        cell.titleLabel.text = quests[indexPath.row].title
        cell.descriptionLabel.text = quests[indexPath.row].description
        cell.rewardLabel.text = "\(quests[indexPath.row].xp) XP"
        cell.titleLabel.addCharacterSpacing()
        cell.descriptionLabel.addCharacterSpacing()
        cell.rewardLabel.addCharacterSpacing()
        
        return cell
    }
    
    func tableView(_ tableView: UITableView, numberOfRowsInSection section: Int) -> Int {
        self.quests.count
    }
    
    @objc func showTicketBuyController() {
        self.show(self.ticketBuyVC, sender: self)
    }
}

//#Preview {
//    var tvc = TeamPlayMenuController()
//    tvc.team = .mock()
//    tvc.quests = [.mock(), .mock(), .mock()]
//    
//    return tvc
//}
